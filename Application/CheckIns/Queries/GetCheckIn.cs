using System;
using Application.CheckIns.DTOs;
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Persistence;

namespace Application.CheckIns.Queries;

public class GetCheckIn
{
    public class Query : IRequest<Result<CheckInDto>>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, Result<CheckInDto>>
    {
        public async Task<Result<CheckInDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var checkIn = await context.CheckIns.FindAsync([request.Id], cancellationToken);

            if (checkIn == null) return Result<CheckInDto>.Failure("No check in exists", 404);

            return Result<CheckInDto>.Success(mapper.Map<CheckInDto>(checkIn));
        }
    }
}
