export interface Message {                                                                                                                                                                                                    
    id: number                                                                                                                                                                                                             
    role: "user" | "assistant"                                                                                                                                                                                           
    content: string
    imageUrl?: string
    time: string
}