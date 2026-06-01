using Application.CheckIns.DTOs;
using Application.Core;
using Application.Core.Interfaces;
using Application.Export.DtOs;
using Application.Questions.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Export.Queries;

public class GetExportData
{
    public class Query : IRequest<Result<ExportDto>> { }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<ExportDto>>
    {
        public async Task<Result<ExportDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();

            var checkIns = await context.CheckIns
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.Date)
                .ProjectTo<CheckInDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            var questions = await context.Questions
                .Where(q => q.UserId == userId && !q.IsAsked)
                .OrderByDescending(q => q.CreatedAt)
                .ProjectTo<QuestionDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            MetricAverages? averages = null;
            if (checkIns.Count > 0)
            {
                var weightReadings = checkIns.Where(c => c.Weight.HasValue).ToList();
                averages = new MetricAverages
                {
                    Mood = Math.Round(checkIns.Average(c => c.Mood), 1),
                    Pain = Math.Round(checkIns.Average(c => c.Pain), 1),
                    Fatigue = Math.Round(checkIns.Average(c => c.Fatigue), 1),
                    Nausea = Math.Round(checkIns.Average(c => c.Nausea), 1),
                    AverageWeight = weightReadings.Count > 0
                        ? Math.Round(weightReadings.Average(c => (double)c.Weight!.Value), 1)
                        : null,
                };
            }

            return Result<ExportDto>.Success(new ExportDto
            {
                CheckIns = checkIns,
                PendingQuestions = questions,
                Averages = averages
            });
        }
    }
}