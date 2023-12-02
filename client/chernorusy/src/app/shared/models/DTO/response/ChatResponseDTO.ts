
export interface IChatResponseDTO {
  id: string;
  name: string;
  lastMessage: {
    id: string;
    sender: {
      id: string;
      name: string;
    },
    message: string;
    dateTime: string;
  }
}
