using Application.Core;
using Application.Core.Interfaces;
using Application.Sharing.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Sharing.Queries;

public class GetShareLinks
{
    public class Query : IRequest<Result<List<ShareLinkDto>>> { }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<ShareLinkDto>>>
    {
        public async Task<Result<List<ShareLinkDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var links = await context.ShareLinks
                .Where(s => s.UserId == userAccessor.GetUserId())
                .OrderBy(s => s.RevokedAt.HasValue)
                .ThenByDescending(s => s.CreatedAt)
                .ProjectTo<ShareLinkDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<ShareLinkDto>>.Success(links);
        }
    }
}
