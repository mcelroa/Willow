using System;
using Application.CheckIns.DTOs;
using Application.Core;
using Application.Core.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CheckIns.Queries;

public class GetCheckInList
{
    public class Query : IRequest<Result<List<CheckInDto>>> { }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<CheckInDto>>>
    {
        public async Task<Result<List<CheckInDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var checkIns = await context.CheckIns
                .Where(x => x.UserId == userAccessor.GetUserId())
                .ProjectTo<CheckInDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<CheckInDto>>.Success(checkIns);
        }
    }

}
