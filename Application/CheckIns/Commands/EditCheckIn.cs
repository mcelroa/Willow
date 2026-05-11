using System;
using Application.CheckIns.DTOs;
using Application.Core;
using AutoMapper;
using MediatR;
using Persistence;

namespace Application.CheckIns.Commands;

public class EditCheckIn
{
    public class Command : IRequest<Result<Unit>>
    {
        public required EditCheckInDto CheckInDto { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var checkIn = await context.CheckIns.FindAsync([request.CheckInDto.Id], cancellationToken);

            if (checkIn == null) return Result<Unit>.Failure("Check in not found", 404);

            // Mapping in place rather than creating new object
            mapper.Map(request.CheckInDto, checkIn);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<Unit>.Failure("Failed to update check in", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
