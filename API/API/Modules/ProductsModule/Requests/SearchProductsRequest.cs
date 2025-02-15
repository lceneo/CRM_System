﻿namespace API.Modules.ProductsModule.Requests;

public class SearchProductsRequest
{
    public HashSet<Guid>? Ids { get; set; }
    /// <summary>
    /// Ищет по равенству цены
    /// </summary>
    public double? PriceEq { get; set; }
    /// <summary>
    /// Ищет чтобы цена была больше
    /// </summary>
    public double? PriceHigher { get; set; }
    /// <summary>
    /// Ищет чтобы цена была меньше
    /// </summary>
    public double? PriceLower { get; set; }
    public string? Description { get; set; }
    public HashSet<Guid>? TaskIds { get; set; }
}