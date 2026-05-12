<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::where('is_active', true)->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required'],
            'slug' => ['required','unique:categories'],
            'icon' => ['nullable']
        ]);

        return Category::create($data);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => ['sometimes'],
            'slug' => ['sometimes','unique:categories,slug,'.$category->id],
            'icon' => ['nullable'],
            'is_active' => ['boolean']
        ]);

        $category->update($data);

        return $category;
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'deleted']);
    }
}