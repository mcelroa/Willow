using Application.Core;
using Application.Core.Interfaces;
using Application.Medications.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Medications.Commands;

public class UpdateMedication
{
    public class Command : IRequest<Result<MedicationDto>>
    {
        public string Id { get; set; } = "";
        public SaveMedicationDto Dto { get; set; } = null!;
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<MedicationDto>>
    {
        public async Task<Result<MedicationDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var medication = await context.Medications
                .Include(m => m.Schedules)
                .FirstOrDefaultAsync(m => m.Id == request.Id && m.UserId == userAccessor.GetUserId(), cancellationToken);

            if (medication == null) return Result<MedicationDto>.Failure("Medication not found", 404);

            medication.Name = request.Dto.Name;
            medication.Dosage = request.Dto.Dosage;
            medication.TargetSymptom = request.Dto.TargetSymptom;
            medication.IsActive = request.Dto.IsActive;

            context.MedicationSchedules.RemoveRange(medication.Schedules);
            medication.Schedules = request.Dto.Schedules.Select(s => new MedicationSchedule
            {
                DayOfWeek = s.DayOfWeek,
                Time = TimeOnly.Parse(s.Time),
                MedicationId = medication.Id,
            }).ToList();

            var success = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!success) return Result<MedicationDto>.Failure("Failed to update medication", 400);

            return Result<MedicationDto>.Success(mapper.Map<MedicationDto>(medication));
        }
    }
}
