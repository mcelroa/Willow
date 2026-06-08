using Application.Core;
using Application.Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Adherence.Commands;

public class UnmarkAdherence
{
    public class Command : IRequest<Result<Unit>>
    {
        public string MedicationId { get; set; } = "";
        public DateOnly Date { get; set; }
    }

    public class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();

            var record = await context.MedicationAdherences
                .FirstOrDefaultAsync(
                    a => a.MedicationId == request.MedicationId && a.UserId == userId && a.Date == request.Date,
                    cancellationToken);

            if (record == null) return Result<Unit>.Success(Unit.Value);

            context.MedicationAdherences.Remove(record);
            await context.SaveChangesAsync(cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
