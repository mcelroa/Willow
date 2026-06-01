using Application.CheckIns.DTOs;
using Application.Core;
using Application.Export.DtOs;
using Application.Questions.DTOs;
using Application.Sharing.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Sharing.Queries;

public class GetSharedView
{
    public class Query : IRequest<Result<SharedViewDto>>
    {
        public required string Token { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<SharedViewDto>>
    {
        public async Task<Result<SharedViewDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var shareLink = await context.ShareLinks
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Token == request.Token, cancellationToken);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            if (shareLink == null
                || shareLink.RevokedAt.HasValue
                || (shareLink.ExpiresAt.HasValue && shareLink.ExpiresAt.Value < today))
            {
                return Result<SharedViewDto>.Failure("Link not found or expired", 404);
            }

            var ownerId = shareLink.UserId;

            var checkIns = await context.CheckIns
                .Where(c => c.UserId == ownerId)
                .OrderByDescending(c => c.Date)
                .ProjectTo<CheckInDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            var questions = await context.Questions
                .Where(q => q.UserId == ownerId && !q.IsAsked)
                .OrderByDescending(q => q.CreatedAt)
                .ProjectTo<QuestionDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            MetricAverages? averages = null;
            if (checkIns.Count > 0)
            {
                averages = new MetricAverages
                {
                    Mood = Math.Round(checkIns.Average(c => c.Mood), 1),
                    Pain = Math.Round(checkIns.Average(c => c.Pain), 1),
                    Fatigue = Math.Round(checkIns.Average(c => c.Fatigue), 1),
                    Nausea = Math.Round(checkIns.Average(c => c.Nausea), 1),
                };
            }

            shareLink.LastViewedAt = DateTimeOffset.UtcNow;
            await context.SaveChangesAsync(cancellationToken);

            return Result<SharedViewDto>.Success(new SharedViewDto
            {
                OwnerName = shareLink.User.UserName ?? "Unknown",
                EarliestDate = checkIns.Count > 0 ? checkIns.Min(c => c.Date) : null,
                LatestDate = checkIns.Count > 0 ? checkIns.Max(c => c.Date) : null,
                CheckIns = checkIns,
                PendingQuestions = questions,
                Averages = averages,
            });
        }
    }
}
