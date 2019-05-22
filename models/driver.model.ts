export interface DriverModel {
    id?: number,
    name: string,
    surname: string,
    totalHours: number
    routes: {
        id: number,
        title: string,
        time: number,
        dateOfRecording: string
    }[]
}