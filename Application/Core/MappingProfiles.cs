using System;
using Application.CheckIns.DTOs;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<CheckIn, CheckInDto>();
        CreateMap<CreateCheckInDto, CheckIn>();
        CreateMap<EditCheckInDto, CheckIn>();
    }
}
