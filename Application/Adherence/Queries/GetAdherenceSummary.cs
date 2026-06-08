using Application.Adherence.DTOs;
using Application.Core;
using Application.Core.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Adherence.Queries;

public class GetAdherenceSummary
{
    public class Query : IRequest<Result<List<AdherenceSummaryDto>>>
    {
        public int Days { get; set; } = 30;
    }

    public class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<AdherenceSummaryDto>>>
    {
        public async Task<Result<List<AdherenceSummaryDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var cutoff = today.AddDays(-(request.Days - 1));

            var medications = await context.Medications
                .Include(m => m.Schedules)
                .Where(m => m.UserId == userId && m.IsActive)
                .ToListAsync(cancellationToken);

            var adherenceRecords = await context.MedicationAdherences
                .Where(a => a.UserId == userId && a.Date >= cutoff && a.Date <= today)
                .ToListAsync(cancellationToken);

            var result = medications.Select(med =>
            {
                var scheduledWeekdays = med.Schedules.Select(s => s.DayOfWeek).ToHashSet();
                var scheduledDays = 0;
                for (var d = cutoff; d <= today; d = d.AddDays(1))
                {
                    if (scheduledWeekdays.Contains((int)d.DayOfWeek))
                        scheduledDays++;
                }

                var takenDays = adherenceRecords.Count(a => a.MedicationId == med.Id);

                return new AdherenceSummaryDto
                {
                    MedicationId = med.Id,
                    TakenDays = takenDays,
                    ScheduledDays = scheduledDays,
                };
            }).ToList();

            return Result<List<AdherenceSummaryDto>>.Success(result);
        }
    }
}
