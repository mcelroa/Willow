using System;
using Application.Core;
using Application.Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Questions.Commands;

public class DeleteQuestion
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var question = await context.Questions
                .FirstOrDefaultAsync(q => q.Id == request.Id && q.UserId == userAccessor.GetUserId(), cancellationToken);

            if (question == null) return Result<Unit>.Failure("Not found", 404);

            context.Questions.Remove(question);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<Unit>.Failure("Failed to delete question", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
