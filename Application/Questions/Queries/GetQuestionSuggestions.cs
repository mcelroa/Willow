using Application.CheckIns.DTOs;
using Application.Core;
using Application.Core.Interfaces;
using Application.Medications.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Questions.Queries;

public class GetQuestionSuggestions
{
    public class Query : IRequest<Result<List<string>>> { }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor, IAiService aiService)
        : IRequestHandler<Query, Result<List<string>>>
    {
        public async Task<Result<List<string>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = userAccessor.GetUserId();
            var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));

            var checkIns = await context.CheckIns
                .Where(c => c.UserId == userId && c.Date >= cutoff)
                .OrderByDescending(c => c.Date)
                .ProjectTo<CheckInDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            var medications = await context.Medications
                .Where(m => m.UserId == userId && m.IsActive)
                .ProjectTo<MedicationDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            var existingQuestions = await context.Questions
                .Where(q => q.UserId == userId && !q.IsAsked)
                .Select(q => q.Text)
                .ToListAsync(cancellationToken);

            var suggestions = await aiService.GetQuestionSuggestionsAsync(
                checkIns, medications, existingQuestions, cancellationToken);

            return Result<List<string>>.Success(suggestions);
        }
    }
}
