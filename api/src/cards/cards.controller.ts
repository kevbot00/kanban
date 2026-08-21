import { Controller, Get, Param } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('/:id')
  getCardById(@Param('id') id: string): Promise<any> {
    return this.cardsService.findById(id);
  }
}
