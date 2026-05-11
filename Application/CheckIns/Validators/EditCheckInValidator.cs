using System;
using Application.CheckIns.Commands;
using FluentValidation;

namespace Application.CheckIns.Validators;

public class EditCheckInValidator : AbstractValidator<EditCheckIn.Command>
{
    public EditCheckInValidator()
    {
        RuleFor(x => x.CheckInDto).SetValidator(new BaseCheckInValidator());
        RuleFor(x => x.CheckInDto.Id).NotEmpty();
    }
}
