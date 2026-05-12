using Application.CheckIns.DTOs;
using Application.Core;
using Application.Core.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CheckIns.Commands;

public class EditCheckIn
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
        public required SaveCheckInDto CheckInDto { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var checkIn = await context.CheckIns
                .FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == userAccessor.GetUserId(), cancellationToken);

            if (checkIn == null) return Result<Unit>.Failure("Check in not found", 404);

            mapper.Map(request.CheckInDto, checkIn);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<Unit>.Failure("Failed to update check in", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
