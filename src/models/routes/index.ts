export interface IRoutesModel {
    id: number;
    name: string;
    priority: number;
    childRoute?: IRoutesModel[];
}
