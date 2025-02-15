﻿using System.ComponentModel.DataAnnotations;
using API.Modules.AccountsModule.Entities;

namespace API.Modules.AccountsModule.DTO;

public class RegisterByAdminRequest
{
    [Required] public string Login { get; set; }
    [Required] public string Email { get; set; }
    [Required] public AccountRole Role { get; set; }
}