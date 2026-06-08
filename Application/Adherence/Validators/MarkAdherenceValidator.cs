using Application.Adherence.Commands;
using FluentValidation;

namespace Application.Adherence.Validators;

public class MarkAdherenceValidator : AbstractValidator<MarkAdherence.Command>
{
    public MarkAdherenceValidator()
    {
        RuleFor(x => x.MedicationId).NotEmpty().WithMessage("Medication ID is required.");
        RuleFor(x => x.Date).NotEqual(default(DateOnly)).WithMessage("Date is required.");
    }
}
