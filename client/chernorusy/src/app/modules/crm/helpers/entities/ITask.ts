import {IProfileResponseDTO} from "../../../profile/DTO/response/ProfileResponseDTO";
import {TaskState} from "../enums/TaskState";
import {IComment} from "./IComment";
import {IProduct} from "./IProduct";

export interface ITask {
    id: string;
    assignedTo: IProfileResponseDTO;
    state: TaskState;
    title: string;
    descrption: string;
    creation: {
        id: string,
        user: IProfileResponseDTO,
        dateTime: string
    };
    lastEdition: {
        id: string,
        user: IProfileResponseDTO,
        dateTime: string
    };
    comments: IComment[];
    products: Omit<IProduct, 'taskIds'>[];
}
