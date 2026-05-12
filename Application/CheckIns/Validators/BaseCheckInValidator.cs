using System;
using Application.CheckIns.DTOs;
using FluentValidation;

namespace Application.CheckIns.Validators;

public class BaseCheckInValidator : AbstractValidator<SaveCheckInDto>
{
    public BaseCheckInValidator()
    {
        RuleFor(x => x.Mood).InclusiveBetween(1, 10);
        RuleFor(x => x.Pain).InclusiveBetween(1, 10);
        RuleFor(x => x.Fatigue).InclusiveBetween(1, 10);
        RuleFor(x => x.Nausea).InclusiveBetween(1, 10);
        RuleFor(x => x.Date).LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today));
    }
}
