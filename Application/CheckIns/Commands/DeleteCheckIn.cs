using System;
using Application.Core;
using Application.Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CheckIns.Commands;

public class DeleteCheckIn
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
            var checkIn = await context.CheckIns
                .FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == userAccessor.GetUserId(), cancellationToken);

            if (checkIn == null) return Result<Unit>.Failure("Check in not found", 404);

            context.CheckIns.Remove(checkIn);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<Unit>.Failure("Failed to delete check in", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
