import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const STEP = 1000;

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  findById(id: string): Promise<any> {
    return this.prisma.card.findUnique({
      where: { id },
      omit: { createdAt: true, updatedAt: true },
    });
  }

  create(data: { title: string; description: string; columnId: string }) {
    return this.prisma.$transaction(async (prisma) => {
      const column = await prisma.boardColumn.findUnique({
        where: { id: data.columnId },
        select: { id: true },
      });

      if (!column)
        throw new NotFoundException(`Column ${data.columnId} not found`);

      const last = await prisma.card.findFirst({
        where: { columnId: data.columnId },
        orderBy: [{ position: 'desc' }, { id: 'desc' }],
        select: { position: true },
      });

      return prisma.card.create({
        data: {
          title: data.title,
          description: data.description,
          columnId: data.columnId,
          position: last ? last.position + STEP : STEP,
        },
      });
    });
  }

  update(id: string, data: { title?: string; description?: string }) {
    return this.prisma.card.update({
      where: { id },
      data,
    });
  }

  move(id: string, toColumnId: string, toIndex: number) {
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
      const position =
        prev === undefined && next === undefined
          ? STEP
          : prev === undefined
            ? next - STEP
            : next === undefined
              ? prev + STEP
              : (prev + next) / 2;

      return prisma.card.update({
        where: { id },
        data: { columnId: toColumnId, position },
        omit: { createdAt: true, updatedAt: true },
      });
    });
  }
}
