using Application.Core;
using Application.Core.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Adherence.Commands;

public class MarkAdherence
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

            var medication = await context.Medications
                .FirstOrDefaultAsync(m => m.Id == request.MedicationId && m.UserId == userId, cancellationToken);

            if (medication == null) return Result<Unit>.Failure("Medication not found", 404);

            var alreadyExists = await context.MedicationAdherences
                .AnyAsync(a => a.MedicationId == request.MedicationId && a.UserId == userId && a.Date == request.Date, cancellationToken);

            if (alreadyExists) return Result<Unit>.Success(Unit.Value);

            context.MedicationAdherences.Add(new MedicationAdherence
            {
                MedicationId = request.MedicationId,
                UserId = userId,
                Date = request.Date,
            });

            var success = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!success) return Result<Unit>.Failure("Failed to mark adherence", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
