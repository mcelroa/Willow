using Application.Core;
using Application.Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Medications.Commands;

public class DeleteMedication
{
    public class Command : IRequest<Result<Unit>>
    {
        public string Id { get; set; } = "";
    }

    public class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var medication = await context.Medications
                .FirstOrDefaultAsync(m => m.Id == request.Id && m.UserId == userAccessor.GetUserId(), cancellationToken);

            if (medication == null) return Result<Unit>.Failure("Medication not found", 404);

            context.Medications.Remove(medication);

            var success = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!success) return Result<Unit>.Failure("Failed to delete medication", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
