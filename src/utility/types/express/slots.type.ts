export interface ISlots {
  availableFrom: String;
  availableTo: String;
  capacity: number;
}

export interface ICreateSlot {
  availableFrom: Date;
  availableTo: Date;
  email: string;
  capacity: number;
}

export type IReserveSlot = {
  slotId: number;
  email: string;
};
