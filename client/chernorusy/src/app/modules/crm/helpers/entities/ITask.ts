import { IProfileResponseDTO } from '../../../profile/DTO/response/ProfileResponseDTO';
import { TaskState } from '../enums/TaskState';
import { IComment } from './IComment';
import { IProduct } from './IProduct';
import { IColumn } from './IColumn';
import { Client } from 'src/app/shared/services/client.service';

export interface ITask {
  id: string;
  assignedTo: IProfileResponseDTO;
  state: TaskState;
  title: string;
  descrption: string;
  creation: {
    id: string;
    user: IProfileResponseDTO;
    dateTime: string;
  };
  lastEdition: {
    id: string;
    user: IProfileResponseDTO;
    dateTime: string;
  };
  comments: IComment[];
  products: Omit<IProduct, 'taskIds'>[];
  column: IColumn;
  client: Client;
}
