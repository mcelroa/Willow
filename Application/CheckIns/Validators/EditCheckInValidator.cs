using Application.CheckIns.Commands;
using FluentValidation;

namespace Application.CheckIns.Validators;

public class EditCheckInValidator : AbstractValidator<EditCheckIn.Command>
{
    public EditCheckInValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.CheckInDto).SetValidator(new BaseCheckInValidator());
    }
}
