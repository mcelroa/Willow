using Application.Sharing.Commands;
using FluentValidation;

namespace Application.Sharing.Validators;

public class CreateShareLinkValidator : AbstractValidator<CreateShareLink.Command>
{
    public CreateShareLinkValidator()
    {
        RuleFor(x => x.Label)
            .MaximumLength(100)
            .When(x => x.Label != null);

        RuleFor(x => x.ExpiresAt)
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Expiry date must be today or in the future.")
            .When(x => x.ExpiresAt.HasValue);
    }
}
