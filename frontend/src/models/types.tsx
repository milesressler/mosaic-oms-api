export interface BaseObject {
    uuid: string;
    created: string;
    updated: string;
    id: number;
}

export interface Order extends BaseObject {
    orderStatus: OrderStatus;
    customer: Customer;
    lastStatusUpdate: string;

}

export interface OrderDetails extends Order {
    items: OrderItem[];
    lastStatusChange: {
        user: string;
        assigneeExt: string
        status: OrderStatus;
        timestamp: string;
    };
    specialInstructions: string;
    history: {
        user: string;
        status: OrderStatus;
        timestamp: string;
    }[];
}

export interface Customer {
    name: string
}

export interface User {
    name: string
}

export enum Location {
    MOSAIC_NORTH = "MOSAIC_NORTH",
    MOSAIC_SOUTH = "MOSAIC_SOUTH",
    MOSAIC_FORT_WORTH = "MOSAIC_FORT_WORTH",
}

export interface TransitInfo {
    stopId: string,
    direction?: string,
    routeId: string,
    tripId: string,
    stopInfo: {
        stopId: string,
        stopName: string,
    },
    nextArrivalTime: number,
    previousArrivalTime?: number,
}


export enum OrderStatus {
    CREATED = "CREATED",
    FILLED = "FILLED",
    ASSIGNED = "ASSIGNED",
    READY_FOR_PICKUP = "READY_FOR_PICKUP",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
}

    interface ItemRequest {
    description: string;
    notes: string;
    quantity: number;
}

export interface OrderRequest {
    customerName: string;
    customerPhone?: string;
    specialInstructions?: string;
    optInNotifications?: boolean;
    items: ItemRequest[];
}

export interface ApiResponse<T> {
    data: T;
    error?: string;
}

export interface Page<T> {
    content?: T[];
    totalPages?: number;
    totalElements?: number;
}
export interface Item {
    id: number;
    placeholder: string;
    description: string;
}

export interface AdminItem extends Item{
    suggestedItem: boolean;
    totalOrdered: number;
    totalFilled: number;
}

export interface UpdateItemRequest {
    suggestedItem?: boolean
    placeholder?: string
}
export interface OrderItem {
    description: string;
    quantityRequested: number;
    quantityFulfilled: number;
    notes: string | null;
    id: number;
}


