using Application.CheckIns.DTOs;
using Application.Core;
using Application.Core.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CheckIns.Queries;

public class GetCheckIn
{
    public class Query : IRequest<Result<CheckInDto>>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<CheckInDto>>
    {
        public async Task<Result<CheckInDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var checkIn = await context.CheckIns
                .Where(x => x.Id == request.Id && x.UserId == userAccessor.GetUserId())
                .ProjectTo<CheckInDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (checkIn == null) return Result<CheckInDto>.Failure("Check in not found", 404);

            return Result<CheckInDto>.Success(checkIn);
        }
    }
}
