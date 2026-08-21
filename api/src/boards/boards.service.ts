import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<any> {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          omit: { createdAt: true, updatedAt: true },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              omit: { createdAt: true, updatedAt: true },
            },
          },
        },
      },
      omit: { createdAt: true, updatedAt: true },
    });

    if (!board) return null;

    return board;
  }
}
