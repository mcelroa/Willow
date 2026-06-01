using Application.Core;
using Application.Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Sharing.Commands;

public class RevokeShareLink
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
            var shareLink = await context.ShareLinks
                .FirstOrDefaultAsync(s => s.Id == request.Id && s.UserId == userAccessor.GetUserId(), cancellationToken);

            if (shareLink == null) return Result<Unit>.Failure("Not found", 404);

            shareLink.RevokedAt = DateTimeOffset.UtcNow;

            var success = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!success) return Result<Unit>.Failure("Failed to revoke share link", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
