import {TaskState} from "../../enums/TaskState";

export interface ITaskCreateOrUpdateDTO
{
    id?: string;
    assignedTo: string;
    state: TaskState;
    title: string;
    descrption: string;
    productIds: string[];
}
