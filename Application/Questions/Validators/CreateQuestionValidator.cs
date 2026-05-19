using Application.Questions.Commands;
using FluentValidation;

namespace Application.Questions.Validators;

public class CreateQuestionValidator : AbstractValidator<CreateQuestion.Command>
{
    public CreateQuestionValidator()
    {
        RuleFor(x => x.Dto.Text).NotEmpty();
    }
}
