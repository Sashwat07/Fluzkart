import { ApiProperty } from "@nestjs/swagger";

export class CreateContactDto {
    @ApiProperty()
    email:string|undefined

    @ApiProperty()
    phoneNumber: Number|undefined

}
