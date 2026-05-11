using System;
using Application.CheckIns.Commands;
using FluentValidation;

namespace Application.CheckIns.Validators;

public class CreateCheckInValidator : AbstractValidator<CreateCheckIn.Command>
{
    public CreateCheckInValidator()
    {
        RuleFor(x => x.CheckInDto).SetValidator(new BaseCheckInValidator());
    }
}
