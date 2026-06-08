using Application.Core;
using Application.Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Adherence.Queries;

public class GetDailyAdherence
{
    public class Query : IRequest<Result<List<string>>>
    {
        public DateOnly Date { get; set; }
    }

    public class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<string>>>
    {
        public async Task<Result<List<string>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var medicationIds = await context.MedicationAdherences
                .Where(a => a.UserId == userAccessor.GetUserId() && a.Date == request.Date)
                .Select(a => a.MedicationId)
                .ToListAsync(cancellationToken);

            return Result<List<string>>.Success(medicationIds);
        }
    }
}
