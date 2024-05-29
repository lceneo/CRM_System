import {TaskState} from "../../enums/TaskState";

export interface ITaskCreateOrUpdateDTO
{
    id?: string;
    assignedTo: string;
    columnId: string;
    title: string;
    descrption: string;
    productIds: string[];
    clientId: string;
}
