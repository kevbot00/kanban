import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HIDE_TIMESTAMPS } from '../common/constants';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      omit: HIDE_TIMESTAMPS,
      include: {
        columns: {
          orderBy: { position: 'asc' },
          omit: HIDE_TIMESTAMPS,
          include: {
            cards: {
              orderBy: [{ position: 'asc' }, { id: 'asc' }],
              omit: HIDE_TIMESTAMPS,
            },
          },
        },
      },
    });

    if (!board) throw new NotFoundException(`Board ${id} not found`);
    return board;
  }
}
