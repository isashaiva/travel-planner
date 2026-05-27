export interface GeneratedTrip {
  id: string;

  title: string;

  description: string;

  places: any[];

  budget: {
    food: number;
    taxi: number;
    hotel: number;
    total: number;
  };

  duration: string;

  type: string;
}
