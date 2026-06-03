using Application.Medications.Commands;
using Application.Medications.DTOs;
using FluentValidation;

namespace Application.Medications.Validators;

public class CreateMedicationValidator : AbstractValidator<CreateMedication.Command>
{
    public CreateMedicationValidator()
    {
        RuleFor(x => x.Dto).SetValidator(new SaveMedicationDtoValidator());
    }
}

public class UpdateMedicationValidator : AbstractValidator<UpdateMedication.Command>
{
    public UpdateMedicationValidator()
    {
        RuleFor(x => x.Dto).SetValidator(new SaveMedicationDtoValidator());
    }
}

public class SaveMedicationDtoValidator : AbstractValidator<SaveMedicationDto>
{
    private static readonly string[] ValidSymptoms = ["mood", "pain", "fatigue", "nausea"];

    public SaveMedicationDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100);

        RuleFor(x => x.Dosage)
            .MaximumLength(50)
            .When(x => x.Dosage != null);

        RuleFor(x => x.TargetSymptom)
            .Must(s => ValidSymptoms.Contains(s))
            .WithMessage("Target symptom must be mood, pain, fatigue, or nausea.")
            .When(x => x.TargetSymptom != null);

        RuleForEach(x => x.Schedules).ChildRules(schedule =>
        {
            schedule.RuleFor(s => s.DayOfWeek)
                .InclusiveBetween(0, 6).WithMessage("Day of week must be 0–6.");

            schedule.RuleFor(s => s.Time)
                .NotEmpty().WithMessage("Time is required.")
                .Matches(@"^\d{2}:\d{2}$").WithMessage("Time must be in HH:mm format.");
        });
    }
}
