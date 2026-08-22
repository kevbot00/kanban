import { Controller, Get, Param, Patch, Body, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('/:id')
  getCardById(@Param('id') id: string): Promise<any> {
    return this.cardsService.findById(id);
  }

  @Patch('/:id')
  updateCard(@Param('id') id: string, @Body() data: any): Promise<any> {
    return this.cardsService.update(id, data);
  }

  @Post('/:id/move')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['toColumnId', 'toIndex'],
      properties: {
        toColumnId: { type: 'string' },
        toIndex: { type: 'number' },
      },
    },
  })
  moveCard(
    @Param('id') id: string,
    @Body() body: { toColumnId: string; toIndex: number },
  ): Promise<any> {
    const { toColumnId, toIndex } = body;
    return this.cardsService.move(id, toColumnId, toIndex);
  }
}
