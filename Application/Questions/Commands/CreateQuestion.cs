using Application.Core;
using Application.Core.Interfaces;
using Application.Questions.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Persistence;

namespace Application.Questions.Commands;

public class CreateQuestion
{
    public class Command : IRequest<Result<string>>
    {
        public required CreateQuestionDto Dto { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var question = mapper.Map<Question>(request.Dto);
            question.UserId = userAccessor.GetUserId();
            question.CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

            context.Questions.Add(question);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<string>.Failure("Failed to create question", 400);

            return Result<string>.Success(question.Id);
        }
    }
}
