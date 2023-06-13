import { ApiProperty } from "@nestjs/swagger";

export class CreateContactDto {
    @ApiProperty()
    email:string|null

    @ApiProperty()
    phoneNumber: Number|null

}
