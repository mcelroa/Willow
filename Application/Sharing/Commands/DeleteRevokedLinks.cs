using Application.Core;
using Application.Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Sharing.Commands;

public class DeleteRevokedLinks
{
    public class Command : IRequest<Result<Unit>> { }

    public class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();

            var toDelete = await context.ShareLinks
                .Where(s => s.UserId == userId && s.RevokedAt.HasValue)
                .ToListAsync(cancellationToken);

            context.ShareLinks.RemoveRange(toDelete);
            await context.SaveChangesAsync(cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
