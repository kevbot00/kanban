import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  findById(id: string): Promise<any> {
    return this.prisma.card.findUnique({
      where: { id },
      omit: { createdAt: true, updatedAt: true },
    });
  }
}
