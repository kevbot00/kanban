import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HIDE_TIMESTAMPS, POSITION_STEP } from '../common/constants';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      omit: HIDE_TIMESTAMPS,
    });

    if (!card) throw new NotFoundException(`Card ${id} not found`);
    return card;
  }

  create({ id, title, description, columnId }: CreateCardDto) {
    return this.prisma.$transaction(async (prisma) => {
      const column = await prisma.boardColumn.findUnique({
        where: { id: columnId },
        select: { id: true },
      });
      if (!column) throw new NotFoundException(`Column ${columnId} not found`);

      const last = await prisma.card.findFirst({
        where: { columnId },
        orderBy: [{ position: 'desc' }, { id: 'desc' }],
        select: { position: true },
      });

      return prisma.card.create({
        data: {
          id,
          title,
          description,
          columnId,
          position: last ? last.position + POSITION_STEP : POSITION_STEP,
        },
        omit: HIDE_TIMESTAMPS,
      });
    });
  }

  async update(id: string, data: UpdateCardDto) {
    await this.findById(id);

    return this.prisma.card.update({
      where: { id },
      data,
      omit: HIDE_TIMESTAMPS,
    });
  }

  move(id: string, { toColumnId, toIndex }: MoveCardDto) {
    return this.prisma.$transaction(async (prisma) => {
      const card = await prisma.card.findUnique({
        where: { id },
        include: { column: { select: { boardId: true } } },
      });

      if (!card) throw new NotFoundException(`Card ${id} not found`);

      const toColumn = await prisma.boardColumn.findUnique({
        where: { id: toColumnId },
        select: { boardId: true },
      });

      if (!toColumn)
        throw new NotFoundException(`Column ${toColumnId} not found`);
      if (toColumn.boardId !== card.column.boardId) {
        throw new BadRequestException(
          'Cannot move card to a column in a different board',
        );
      }

      const siblings = await prisma.card.findMany({
        where: { columnId: toColumnId, id: { not: id } },
        orderBy: [{ position: 'asc' }, { id: 'asc' }],
        select: { position: true },
      });
      const prev = siblings[toIndex - 1]?.position;
      const next = siblings[toIndex]?.position;

      let position: number;
      if (prev === undefined && next === undefined) {
        position = POSITION_STEP;
      } else if (prev === undefined) {
        position = next - POSITION_STEP;
      } else if (next === undefined) {
        position = prev + POSITION_STEP;
      } else {
        position = (prev + next) / 2;
      }

      return prisma.card.update({
        where: { id },
        data: { columnId: toColumnId, position },
        omit: HIDE_TIMESTAMPS,
      });
    });
  }
}
