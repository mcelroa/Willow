using System;
using Application.CheckIns.DTOs;
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Persistence;

namespace Application.CheckIns.Commands;

public class CreateCheckIn
{
    public class Command : IRequest<Result<string>>
    {
        public required CreateCheckInDto CheckInDto { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var checkIn = mapper.Map<CheckIn>(request.CheckInDto);

            context.CheckIns.Add(checkIn);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<string>.Failure("Failed to create check in", 400);

            return Result<string>.Success(checkIn.Id);
        }
    }

}
