import {TaskState} from "../../enums/TaskState";

export interface ITaskCreateDTO
{
    id: string;
    assignedTo: string;
    state: TaskState;
    title: string;
    descrption: string;
    productIds: string[];
}
