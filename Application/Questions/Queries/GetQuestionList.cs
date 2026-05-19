using Application.Core;
using Application.Core.Interfaces;
using Application.Questions.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Questions.Queries;

public class GetQuestionList
{
    public class Query : IRequest<Result<List<QuestionDto>>> { }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<QuestionDto>>>
    {
        public async Task<Result<List<QuestionDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var questions = await context.Questions
                .Where(q => q.UserId == userAccessor.GetUserId())
                .OrderBy(q => q.IsAsked)
                .ThenByDescending(q => q.CreatedAt)
                .ProjectTo<QuestionDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<QuestionDto>>.Success(questions);
        }
    }
}
